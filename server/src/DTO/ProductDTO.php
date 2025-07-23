<?php
namespace App\DTO;
class ProductDTO
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public float $price,
        public string $image,
        public string $createdAt,
        public string $updatedAt,
        public ?array $owner = null // owner optional
    ) {}
}
