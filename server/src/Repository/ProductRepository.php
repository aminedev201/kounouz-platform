<?php
namespace App\Repository;

use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    public function findLatest(int $limit = 10): array
    {
        return $this->createQueryBuilder('p')
            ->orderBy('p.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }


    public function getVendorProductCount(int $vendorId): int
    {
        return $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.owner = :vendorId')
            ->setParameter('vendorId', $vendorId)
            ->getQuery()
            ->getSingleScalarResult();
    }


    public function searchByName(string $keyword): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.name LIKE :kw')
            ->setParameter('kw', '%' . $keyword . '%')
            ->getQuery()
            ->getResult();
    }
}
