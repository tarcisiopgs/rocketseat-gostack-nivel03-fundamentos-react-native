import React, { useState, useEffect, useCallback } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { AxiosResponse } from 'axios';
import { View, Image } from 'react-native';

import formatValue from '../../utils/formatValue';
import { useCart } from '../../hooks/cart';
import api from '../../services/api';

import FloatingCart from '../../components/FloatingCart';

import {
  Container,
  ProductContainer,
  ProductImage,
  ProductList,
  Product,
  ProductTitle,
  PriceContainer,
  ProductPrice,
  ProductButton,
} from './styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
}

const Dashboard: React.FC = () => {
  const { increment, addToCart, products: productsInCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  const handleAddToCart = useCallback(
    (item: Product): void => {
      const exists = productsInCart.find(({ id }) => id === item.id);

      if (exists) {
        increment(item.id);
      } else {
        addToCart(item);
      }
    },
    [addToCart, productsInCart, increment],
  );

  useEffect(() => {
    const loadProducts = async (): Promise<void> => {
      const response: AxiosResponse = await api.get('products');
      setProducts(response.data);
    };

    loadProducts();
  }, []);

  return (
    <Container>
      <ProductContainer>
        <ProductList
          data={products}
          keyExtractor={item => item.id}
          ListFooterComponent={<View />}
          ListFooterComponentStyle={{
            height: 80,
          }}
          renderItem={({ item }) => (
            <Product>
              <ProductImage source={{ uri: item.image_url }} />
              <ProductTitle>{item.title}</ProductTitle>
              <PriceContainer>
                <ProductPrice>{formatValue(item.price)}</ProductPrice>
                <ProductButton
                  testID={`add-to-cart-${item.id}`}
                  onPress={() => handleAddToCart(item)}
                >
                  <FeatherIcon size={20} name="plus" color="#C4C4C4" />
                </ProductButton>
              </PriceContainer>
            </Product>
          )}
        />
      </ProductContainer>
      <FloatingCart />
    </Container>
  );
};

export default Dashboard;
