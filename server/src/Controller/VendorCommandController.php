<?php
namespace App\Controller;

use App\Entity\Command;
use App\Entity\User;
use App\Repository\CommandRepository;
use App\Service\CommandTransformer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[Route('/api/commands')]
#[IsGranted('ROLE_VENDOR')]
class VendorCommandController extends AbstractController
{
    private const STATUS_CANCELLED   = 0;
    private const STATUS_CONFIRMED = 1;
    private const STATUS_PENDING   = 2;

    private ?UserInterface $currentUser;

    public function __construct(
        private EntityManagerInterface $em,
        private ValidatorInterface $validator,
        TokenStorageInterface $tokenStorage,
    ) {
        $this->currentUser = $tokenStorage->getToken()?->getUser();
    }
    #[Route('/{id}/confirm', name: 'api_commands_vendor_confirm', methods: ['POST'])]
    public function confirm(?Command $command): JsonResponse
    {
        if (!$command) {
            return $this->json(['error' => 'Command not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->currentUser instanceof User ||  $command->getProduct()->getOwner()->getId() !== $this->currentUser->getId()) {
            return $this->json(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
        }

        if ($command->getStatus() === self::STATUS_CONFIRMED) {
            return $this->json(['message' => 'Command is already confirmed.'], Response::HTTP_OK);
        }

        $command->setStatus(self::STATUS_CONFIRMED);

        $this->em->flush();

        return $this->json(['message' => 'Command confirmed successfully.'], Response::HTTP_OK);
    }
    #[Route('/{id}/cancel', name: 'api_commands_vendor_cancel', methods: ['POST'])]
    public function cancelled(?Command $command): JsonResponse
    {
        if (!$command) {
            return $this->json(['error' => 'Command not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->currentUser instanceof User ||  $command->getProduct()->getOwner()->getId() !== $this->currentUser->getId()) {
            return $this->json(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
        }

        if ($command->getStatus() === self::STATUS_CANCELLED) {
            return $this->json(['message' => 'Command is already canceled.'], Response::HTTP_OK);
        }

        $command->setStatus(self::STATUS_CANCELLED);

        $this->em->flush();

        return $this->json(['message' => 'Command canceled successfully.'], Response::HTTP_OK);
    }
    #[Route('/{id}/pending', name: 'api_commands_vendor_pending', methods: ['POST'])]
    public function pending(?Command $command): JsonResponse
    {
        if (!$command) {
            return $this->json(['error' => 'Command not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->currentUser instanceof User ||  $command->getProduct()->getOwner()->getId() !== $this->currentUser->getId()) {
            return $this->json(['error' => 'Access denied.'], Response::HTTP_FORBIDDEN);
        }

        if ($command->getStatus() === self::STATUS_PENDING) {
            return $this->json(['message' => 'This command is already in a pending state.'], Response::HTTP_OK);
        }

        $command->setStatus(self::STATUS_PENDING);

        $this->em->flush();

        return $this->json(['message' => 'Command returned to pending successfully.'], Response::HTTP_OK);
    }
    #[Route('/vendor/list', name: 'api_commands_vendor_list', methods: ['GET'])]
    public function commandList(CommandRepository $commandRepository, CommandTransformer $transformer): JsonResponse
    {
        if(!$this->currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }
        $commands = $commandRepository->findByVendor($this->currentUser->getId());
        return $this->json($transformer->transformMany($commands), Response::HTTP_OK);
    }

    #[Route('/count/vendor', name: 'api_command_count_vendor', methods: ['GET'])]
    public function vendorCommandCount(CommandRepository $commandRepository): JsonResponse
    {
        if(!$this->currentUser instanceof User) {
            return $this->json(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }
        $count = $commandRepository->getVendorCommandCountByProductOwner($this->currentUser->getId());
        return $this->json(['count' => $count], Response::HTTP_OK);
    }



}
