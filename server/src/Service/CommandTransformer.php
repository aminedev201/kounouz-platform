<?php
namespace App\Service;

use App\Entity\Command;
use App\DTO\CommandDTO;

class CommandTransformer
{
    public function transform(Command $command): CommandDTO
    {
        $product = $command->getProduct();
        $user = $command->getUser();

        return new CommandDTO(
            $command->getId(),
            [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'description' => $product->getDescription(),
                'price' => $product->getPrice(),
                'image' => $product->getImage(),
                'createdAt' => $product->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $product->getUpdatedAt()->format('Y-m-d H:i:s'),
            ],
            [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
            ],
            $command->getQuantity(),
            $command->getStatus(),
            $command->getCreatedAt()->format('Y-m-d H:i:s'),
            $command->getUpdatedAt()->format('Y-m-d H:i:s'),
        );
    }

    /**
     * @param Command[] $commands
     * @return CommandDTO[]
     */
    public function transformMany(array $commands): array
    {
        return array_map([$this, 'transform'], $commands);
    }
}
