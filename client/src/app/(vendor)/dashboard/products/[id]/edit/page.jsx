import ProductForm from '../../productForm'

export const metadata = {
  title: 'Edit Product | Dashboard',
  description: '',
};

export default function EditProductPage({ params }) {
  return <ProductForm productId={params.id} />;
}
