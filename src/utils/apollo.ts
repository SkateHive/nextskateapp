import {
    ApolloClient,
    DefaultOptions,
    HttpLink,
    InMemoryCache,
} from '@apollo/client';
import { GRAPHQL_URL } from './constants';
  
  const createApolloClient = (defaultOptions: DefaultOptions) => {
    const httpLink = new HttpLink({
      uri: GRAPHQL_URL,
      fetch,
    });
  
    return new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
      defaultOptions,
    });
  };
  
  const defaultOptions: DefaultOptions = {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  };
  
  const apolloClient = createApolloClient({});
  export const noCacheApolloClient = createApolloClient(defaultOptions);
  
  export default apolloClient;