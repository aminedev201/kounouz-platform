import ProductDetail from './productDetail';

export const metadata = {
  title: 'Product Details | Dashboard',
  description: '',
};

export default function ProductDetailPage({ params }) {
  return <ProductDetail id={params.id} />;
}
