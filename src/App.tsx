import { useCallback, useState } from 'react';
import './App.css';
import { Box, Text } from '@chakra-ui/layout';
import { ImageList } from './annotations/ImageList';
import { Button, useToast } from '@chakra-ui/react';
import { ImageEditor } from './annotations/ImageEditor';
import useAnnotations, { annotationsCacheKey } from './annotations/useAnnotations';
import { AnnotatedImage } from './annotations/models/AnnotatedImage';
import { useQueryClient } from '@tanstack/react-query';
import useAddAnnotatedImage from './annotations/useAddAnnotatedImage';
import useUpdateAnnotatedImage from './annotations/useUpdateAnnotatedImage';

function App() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data } = useAnnotations();
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [imageSelected, setImageSelected] = useState<AnnotatedImage>();
  const addAnnotatedImageMutation = useAddAnnotatedImage(() => {
    queryClient.invalidateQueries([annotationsCacheKey]);
  });
  const updateAnnotatedImageMutation = useUpdateAnnotatedImage(() => {
    queryClient.invalidateQueries([annotationsCacheKey]);
  });

  const handleOpenEditor = useCallback(() => {
    setIsEditorOpen(true);
  }, [setIsEditorOpen]);

  const handleCloseEditor = useCallback(() => {
    setIsEditorOpen(false);
    setImageSelected(undefined);
  }, [setIsEditorOpen]);

  const handleCreateImage = useCallback((annotatedImage: AnnotatedImage) => {
    addAnnotatedImageMutation.mutate(annotatedImage);
    toast({
        title: 'Image Saved.',
        description: 'Your image was saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
    });
    setIsEditorOpen(false);
    setImageSelected(undefined);
  }, [addAnnotatedImageMutation.mutate]);

  const handleUpdateImage = useCallback((annotatedImage: AnnotatedImage) => {
    updateAnnotatedImageMutation.mutate(annotatedImage);
    toast({
      title: 'Image Saved.',
      description: 'Your image was saved successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
  });
    setIsEditorOpen(false);
    setImageSelected(undefined);
  }, [updateAnnotatedImageMutation.mutate]);

  const handleImagePick = useCallback((annotatedImage: AnnotatedImage) => {
    setImageSelected(annotatedImage);
    setIsEditorOpen(true);
  }, []);

  return (
    <main>
      <header>
        <Text fontSize='6xl'>Annotation app</Text>
      </header>
      <section>
        <Box marginTop={8}>
          <Button onClick={handleOpenEditor} disabled={isEditorOpen}>Add Image</Button>
        </Box>
        
        {
          isEditorOpen ? 
            <Box py={8}>
              <ImageEditor annotatedImage={imageSelected} onClose={handleCloseEditor} onCreate={handleCreateImage} onUpdate={handleUpdateImage} />
            </Box>
          : null
        }
        <Box>
          <Text marginY={8} fontSize='xl' textAlign="left">My Annotations</Text>
          <ImageList annotatedImage={data} onImagePick={handleImagePick} isEditorOpen={isEditorOpen} />
        </Box>
      </section>
    </main>
  )
}

export default App;
