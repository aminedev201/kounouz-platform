<?php
// src/Controller/CommandController.php

namespace App\Controller;

use App\Entity\Command;
use App\Entity\User;
use App\Repository\CommandRepository;
use App\Repository\ProductRepository;
use App\Service\CommandTransformer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[Route('/api/commands')]
#[IsGranted('ROLE_USER')]
class CommandController extends AbstractController
{
    private const STATUS_PENDING   = 2;
    private ?UserInterface $currentUser;

    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        TokenStorageInterface $tokenStorage,
    ) {
        $this->currentUser = $tokenStorage->getToken()?->getUser();
    }

    #[Route('', name: 'api_commands_list', methods: ['GET'])]
    public function list(CommandRepository $commandRepository, CommandTransformer $transformer): JsonResponse
    {
        $commands = $commandRepository->findBy(['user' => $this->currentUser], ['createdAt' => 'DESC']);
        return $this->json($transformer->transformMany($commands), Response::HTTP_OK);
    }

    #[Route('', name: 'api_commands_store', methods: ['POST'])]
    public function store(
        Request $request,
        ProductRepository $productRepository,
    ): JsonResponse {

        $data = json_decode($request->getContent(), true);

        if (empty($data['product'])) {
            return $this->json(['error' => 'Product ID is required.'], Response::HTTP_BAD_REQUEST);
        }

        $product = $productRepository->find($data['product']);
        if (!$product) {
            return $this->json(['error' => 'Product not found.'], Response::HTTP_NOT_FOUND);
        }

        $command = new Command();
        $command->setProduct($product);
        $command->setUser($this->currentUser);
        $command->setQuantity(empty($data['quantity']) || !is_numeric($data['quantity']) ? 1 : (int) $data['quantity']);
        $command->setStatus(self::STATUS_PENDING);

        $errors = $this->validator->validate($command);
        if (count($errors) > 0) {
            return $this->json(['errors' => $this->_formatValidationErrors($errors)], Response::HTTP_BAD_REQUEST);
        }

        $this->em->persist($command);
        $this->em->flush();

        return $this->json(['message' => 'Command created successfully.'], Response::HTTP_CREATED);
    }

    // #[Route('/{id}', name: 'api_commands_show', methods: ['GET'])]
    // public function show(?Command $command, CommandTransformer $transformer): JsonResponse
    // {
    //     if (!$command) {
    //         return $this->json(['error' => 'Command not found'], Response::HTTP_NOT_FOUND);
    //     }

    //     if (!$this->currentUser instanceof User || $command->getUser()->getId() !== $this->currentUser->getId()) {
    //         return $this->json(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
    //     }

    //     return $this->json($transformer->transform($command), Response::HTTP_OK);
    // }

    #[Route('/{id}', name: 'api_commands_update', methods: ['PATCH'])]
    public function updateQuantity(
        ?Command $command,
        Request $request,
    ): JsonResponse {

        if (!$command) {
            return $this->json(['error' => 'Command not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->currentUser instanceof User ||
            $command->getUser()->getId() !== $this->currentUser->getId()) {
            return $this->json(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
        }

        if ($command->getStatus() !== self::STATUS_PENDING) {
            return $this->json(['error' => 'Command cannot be updated. Only pending commands can be modified.'], Response::HTTP_BAD_REQUEST);
        }

        $data = json_decode($request->getContent(), true);

        $command->setQuantity((int) ($data['quantity'] ?? null));

        $errors = $this->validator->validate($command);

        if (count($errors) > 0) {
            return $this->json(['errors' => $this->_formatValidationErrors($errors)], Response::HTTP_BAD_REQUEST);
        }

        $this->em->flush();

        return $this->json(['message' => 'Command updated successfully.'], Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_commands_delete', methods: ['DELETE'])]
    public function delete(?Command $command): JsonResponse {

        if (!$command) {
            return $this->json(['error' => 'Command not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->currentUser instanceof User ||
            $command->getUser()->getId() !== $this->currentUser->getId()) {
            return $this->json(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
        }

        if ($command->getStatus() !== self::STATUS_PENDING) {
            return $this->json(['error' => 'Command cannot be deleted. Only pending commands can be deleted.'], Response::HTTP_BAD_REQUEST);
        }

        $this->em->remove($command);
        $this->em->flush();

        return $this->json(['message' => 'Command deleted successfully.'], Response::HTTP_OK);
    }

    private function _formatValidationErrors($errors): array {
        $formatted = [];
        foreach ($errors as $error) {
            $formatted[$error->getPropertyPath()][] = $error->getMessage();
        }
        return $formatted;
    }
}
