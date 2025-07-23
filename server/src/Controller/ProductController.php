<?php
namespace App\Controller;

use App\Entity\Product;
use App\Entity\User;
use App\Repository\ProductRepository;
use App\Service\ProductTransformer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\Response;

#[Route('/api/products')]
#[IsGranted('ROLE_VENDOR')]
class ProductController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
    ) {}

    #[Route('', name: 'api_products_list', methods: ['GET'])]
    public function list(ProductRepository $productRepository, ProductTransformer $transformer): JsonResponse
    {
        $products = $productRepository->findBy(['owner' => $this->getUser()], ['createdAt' => 'DESC']);
        return $this->json($transformer->transformMany($products,false), Response::HTTP_OK);
    }
    #[Route('/count/vendor', name: 'api_product_count_vendor', methods: ['GET'])]
    public function vendorProductCount(ProductRepository $productRepository): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }
        $count = $productRepository->getVendorProductCount($user->getId());
        return $this->json(['count' => $count], Response::HTTP_OK);
    }

    #[Route('', name: 'api_products_store', methods: ['POST'])]
    public function store(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $product = new Product();
        $product->setName($data['name'] ?? '');
        $product->setDescription($data['description'] ?? null);
        $product->setPrice(empty($data['price']) || !is_numeric($data['price']) ? 0 : $data['price']);
        $product->setImage($data['image'] ?? '');
        $product->setOwner($this->getUser());

        $errors = $this->validator->validate($product);
        if (count($errors) > 0) {
            return $this->json(
                ['errors' => $this->_formatValidationErrors($errors)],
                Response::HTTP_BAD_REQUEST
            );
        }

        $this->em->persist($product);
        $this->em->flush();

        return $this->json(['message' => 'Product added successfully.'], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_products_show', methods: ['GET'])]
    public function show(?Product $product, ProductTransformer $transformer): JsonResponse
    {
        if (!$product) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($product->getOwner()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
        }

        return $this->json($transformer->transform($product,false), Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_products_update', methods: ['PUT'])]
    public function update(?Product $product, Request $request): JsonResponse
    {
        if (!$product) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($product->getOwner()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        $product->setName($data['name'] ?? $product->getName());
        $product->setDescription($data['description'] ?? $product->getDescription());
        $product->setPrice((float) ($data['price'] ?? $product->getPrice()));
        $product->setImage($data['image'] ?? $product->getImage());

        $errors = $this->validator->validate($product);
        if (count($errors) > 0) {
            return $this->json(
                ['errors' => $this->_formatValidationErrors($errors)],
                Response::HTTP_BAD_REQUEST
            );
        }

        $this->em->flush();

        return $this->json(['message' => 'Product updated successfully.'], Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_products_delete', methods: ['DELETE'])]
    public function delete(?Product $product): JsonResponse
    {
        if (!$product) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($product->getOwner()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
        }

        $this->em->remove($product);
        $this->em->flush();

        return $this->json(['message' => 'Product deleted successfully.'], Response::HTTP_OK);
    }

    private function _formatValidationErrors($errors): array
    {
        $formatted = [];
        foreach ($errors as $error) {
            $field = $error->getPropertyPath();
            $formatted[$field][] = $error->getMessage();
        }
        return $formatted;
    }
}
