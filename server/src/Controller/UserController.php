<?php
namespace App\Controller;

use App\Entity\User;
use App\Repository\ProductRepository;
use App\Service\ProductTransformer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserController extends AbstractController
{
    private const MIN_PASS_CHAR = 8;
    private const MAX_PASS_CHAR = 50;
    private const ALLOWED_ROLES = ['ROLE_USER','ROLE_VENDOR'];
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
    ) {

    }
   #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register( Request $request): JsonResponse {

        $data = json_decode($request->getContent(), true);

        $errorMessages = [];

        if (empty($data['role'])) {
            $errorMessages['role'][] = 'Role is required';
        } elseif (!in_array($roleValue = strtoupper($data['role']),static::ALLOWED_ROLES ,true)) {
            $errorMessages['role'][] = "This role (". $roleValue .") not allowed";
        }

        if (empty($data['password'])) {
            $errorMessages['password'][] = 'Password is required.';
        } elseif (strlen($data['password']) < self::MIN_PASS_CHAR || strlen($data['password']) > self::MAX_PASS_CHAR) {
            $errorMessages['password'][] = 'Password must be between 8 and 50 characters.';
        }

        if (!isset($data['confirm_password']) || empty($data['confirm_password'])) {
            $errorMessages['confirm_password'][] = 'Confirm password is required.';
        } elseif ($data['password'] !== $data['confirm_password']) {
            $errorMessages['confirm_password'][] = 'Passwords do not match.';
        }

        $user = new User();
        $user->setEmail($data['email'] ?? null);
        $user->setFirstname($data['firstname'] ?? null);
        $user->setLastname($data['lastname'] ?? null);

        $this->_setErrors($user,$errorMessages);

        if (!empty($errorMessages)) {
            return $this->json(['code' => 400,'errors' => $errorMessages], 400);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);
        $user->setRoles( [$roleValue]);
        $user->setAvatar( null);

        $this->em->persist($user);
        $this->em->flush();

        return $this->json(['code' => 201, 'message' => 'User registered successfully'], 201);
    }

    private function _setErrors($user ,&$errorMessages) {
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            foreach ($errors as $error) {
                $propertyPath = $error->getPropertyPath();
                $message = $error->getMessage();
                $errorMessages[$propertyPath][] = $message;
            }
        }
    }

    #[Route('/api/current-user/{id}', name: 'api_show', methods: ['GET'])]
    public function getUserAuth(?User $user): JsonResponse
    {
        // check if user exists
        if (!$user) {
            return new JsonResponse(['code' =>400,'message' => 'User not found'], 400);
        }

        // check if current user has the allowed roles
        if (!$this->isGranted('ROLE_USER') && !$this->isGranted('ROLE_VENDOR')) {
            // throw new AccessDeniedException('Access denied.');
            return $this->json(['error' => 'Access denied.'], 403);
        }

        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Unauthenticated user.'], 401);
        }

        if ($currentUser->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied: token mismatch.'], 403);
        }

        // return user info
        return new JsonResponse([
            'id'        => $user->getId(),
            'firstname' => $user->getFirstname(),
            'lastname'  => $user->getLastname(),
            'email'     => $user->getEmail(),
            'avatar'    => $user->getAvatar(),
            'roles'     => $user->getRoles(),
            'createdAt' => date_format($user->getCreatedAt(),'Y-m-d H:i:s'),
            'updatedAt' => date_format($user->getUpdatedAt(),'Y-m-d H:i:s'),
        ], Response::HTTP_OK);
    }

    #[Route('/api/user/products', name: 'api_public_products', methods: ['GET'])]
    public function userProducts(ProductRepository $productRepository, ProductTransformer $transformer): JsonResponse
    {
        $products = $productRepository->findBy([], ['createdAt' => 'DESC']);
        return $this->json($transformer->transformMany($products), Response::HTTP_OK);
    }
    #[Route('/api/user/profile', name: 'api_edit_profile', methods: ['PUT'])]
    public function editProfile(Request $request): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER') && !$this->isGranted('ROLE_VENDOR')) {
            return $this->json(['error' => 'Access denied.'], 403);
        }

        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthenticated user.'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $errorMessages = [];

        if (isset($data['firstname'])) {
            $user->setFirstname($data['firstname']);
        }
        if (isset($data['lastname'])) {
            $user->setLastname($data['lastname']);
        }
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        $user->setAvatar($data['avatar']);


        $this->_setErrors($user, $errorMessages);

        if (!empty($errorMessages)) {
            return $this->json(['code' => 400, 'errors' => $errorMessages], 400);
        }

        $this->em->flush();

        return $this->json([
            'code' => 200,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'email' => $user->getEmail(),
                'avatar' => $user->getAvatar(),
                'roles' => $user->getRoles(),
                'createdAt' => date_format($user->getCreatedAt(),'Y-m-d H:i:s'),
                'updatedAt' => date_format($user->getUpdatedAt(),'Y-m-d H:i:s'),
            ]
        ], 200);
    }
    #[Route('/api/user/change-password', name: 'api_change_password', methods: ['PUT'])]
    public function changePassword(Request $request): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER') && !$this->isGranted('ROLE_VENDOR')) {
            return $this->json(['error' => 'Access denied.'], 403);
        }

        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthenticated user.'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $errorMessages = [];

        if (empty($data['old_password'])) {
            $errorMessages['old_password'][] = 'Current password is required.';
        } elseif (!$this->passwordHasher->isPasswordValid($user, $data['old_password'])) {
            $errorMessages['old_password'][] = 'Current password is incorrect.';
        }

        if (empty($data['new_password'])) {
            $errorMessages['new_password'][] = 'New password is required.';
        } elseif (strlen($data['new_password']) < 8 || strlen($data['new_password']) > 50) {
            $errorMessages['new_password'][] = 'New password must be between 8 and 50 characters.';
        }

        if (empty($data['confirm_password'])) {
            $errorMessages['confirm_password'][] = 'Confirm password is required.';
        } elseif ($data['new_password'] !== $data['confirm_password']) {
            $errorMessages['confirm_password'][] = 'New passwords do not match.';
        }

        if (!empty($data['new_password']) && !empty($data['old_password']) && $data['new_password'] === $data['old_password']) {
            $errorMessages['new_password'][] = 'New password must be different from current password.';
        }

        if (!empty($errorMessages)) {
            return $this->json(['code' => 400, 'errors' => $errorMessages], 400);
        }
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['new_password']);
        $user->setPassword($hashedPassword);

        $this->em->flush();

        return $this->json([
            'code' => 200,
            'message' => 'Password changed successfully'
        ], 200);
    }

    #[Route('/api/user/delete/my-account', name: 'api_delete_my_account', methods: ['DELETE'])]
    public function deleteMyAccount(Request $request): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER') && !$this->isGranted('ROLE_VENDOR')) {
            return $this->json(['error' => 'Access denied.'], 403);
        }

        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthenticated user.'], 401);
        }

        $this->em->remove($user);

        $this->em->flush();

        return $this->json([
            'code' => 200,
            'message' => 'Your account deleted successfully'
        ], 200);
    }

}
