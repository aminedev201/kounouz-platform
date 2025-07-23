<?php
namespace App\Repository;

use App\Entity\Command;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Command>
 *
 * @method Command|null find($id, $lockMode = null, $lockVersion = null)
 * @method Command|null findOneBy(array $criteria, array $orderBy = null)
 * @method Command[]    findAll()
 * @method Command[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CommandRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Command::class);
    }

    public function findByVendor(int $vendorId): array
    {
        return $this->createQueryBuilder('c')
            ->join('c.product', 'p')
            ->join('p.owner', 'u')
            ->where('u.id = :vendorId')
            ->setParameter('vendorId', $vendorId)
            ->orderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function getVendorCommandCountByProductOwner(int $vendorId): int
    {
        return $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->join('c.product', 'p')
            ->join('p.owner', 'u')
            ->where('u.id = :vendorId')
            ->setParameter('vendorId', $vendorId)
            ->getQuery()
            ->getSingleScalarResult();
    }


    // Add custom methods if needed, for example:
    // /**
    //  * @return Command[]
    //  */
    // public function findByUserId(int $userId): array
    // {
    //     return $this->createQueryBuilder('c')
    //         ->andWhere('c.user = :userId')
    //         ->setParameter('userId', $userId)
    //         ->orderBy('c.createdAt', 'DESC')
    //         ->getQuery()
    //         ->getResult();
    // }
}
