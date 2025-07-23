<?php
namespace App\Service;

use App\Entity\Product;
use App\DTO\ProductDTO;

class ProductTransformer
{
    public function transform(Product $product, bool $includeOwner = true): ProductDTO
    {
        $owner = null;

        if ($includeOwner) {
            $user = $product->getOwner();
            $owner = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname()
            ];
        }

        return new ProductDTO(
            $product->getId(),
            $product->getName(),
            $product->getDescription(),
            $product->getPrice(),
            $product->getImage(),
            $product->getCreatedAt()->format('Y-m-d H:i:s'),
            $product->getUpdatedAt()->format('Y-m-d H:i:s'),
            $owner
        );
    }

    /**
     * @param Product[] $products
     * @param bool $includeOwner
     * @return ProductDTO[]
     */
    public function transformMany(array $products, bool $includeOwner = true): array
    {
        return array_map(fn(Product $product) => $this->transform($product, $includeOwner), $products);
    }
}
