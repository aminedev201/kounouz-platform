<?php
namespace App\DTO;

class CommandDTO
{
    public function __construct(
        public int $id,
        public array $product,
        public array $user,
        public int $quantity,
        public int $status,
        public string $createdAt,
        public string $updatedAt,
    ) {}
}
