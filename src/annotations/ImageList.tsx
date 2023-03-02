import { useCallback } from "react";
import { AnnotatedImage } from "./models/AnnotatedImage";
import { Box, SimpleGrid, Text } from '@chakra-ui/react';

type ImageListProp = {
    annotatedImage?: AnnotatedImage[],
    onImagePick?: (annotatedImage: AnnotatedImage) => void,
    isEditorOpen?: boolean
}

export function ImageList({ annotatedImage = [], onImagePick = () => {}, isEditorOpen = false }: ImageListProp) {

    return(
        <SimpleGrid columns={3} spacing={10}>
            {
                annotatedImage?.map(item =>
                    <button key={item.id} disabled={isEditorOpen} style={{ display: 'flex', flexDirection: 'column' }} onClick={() => onImagePick(item!)}><img alt={item.name} src={item.image} onClick={() => onImagePick(item!)} /><Text fontSize='md'>{item.name}</Text></button>)
            }
        </SimpleGrid>
    );
}