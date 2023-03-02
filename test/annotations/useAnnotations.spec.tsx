import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useAnnotations from '../../src/annotations/useAnnotations';

const queryClient = new QueryClient();

 const wrapper = ({ children }: any) => (
   <QueryClientProvider client={queryClient}>
     {children}
   </QueryClientProvider>
 );
  
const mockAnnotations = [
  { test: "test" },
  { test: "test 2" },
];

global.fetch = jest.fn().mockResolvedValueOnce({
  json: () => Promise.resolve(mockAnnotations),
});

describe('useAnnotations', () => {
  it('should return the correct data', async () => {

    const { result } = renderHook(() => useAnnotations(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockAnnotations);
    });

    
  });
});