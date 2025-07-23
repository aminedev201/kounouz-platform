<?php

namespace App\Security;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: 'lexik_jwt_authentication.on_authentication_success', method: 'onAuthenticationSuccess')]
class JwtSuccessHandler
{
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();

        if ((!$user) || (!$user instanceof User)) {
            return;
        }

        $token = $event->getData()['token'];

        $data = [
            'code' => 200,
            'user' => [
                'id' => $user->getId(),
                'token' => $token,
            ]
        ];

        $event->setData($data);
    }
}
