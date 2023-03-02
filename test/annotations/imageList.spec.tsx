import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import { ImageList } from '../../src/annotations/ImageList';
import { AnnotatedImage } from '../../src/annotations/models/AnnotatedImage';



describe('ImageList component', () => {
  it('should render a grid of images', () => {
    const mockAnnotatedImages: AnnotatedImage[] = [
        { id: 1, name: 'test 1', image: 'test1.jpg', annotations: [] },
        { id: 2, name: 'test 2', image: 'test2.jpg', annotations: [] },
      ];
    const { getAllByAltText } = render(<ImageList annotatedImage={mockAnnotatedImages} onImagePick={() => {}} />);

    const images = getAllByAltText(/test/);
    expect(images).toHaveLength(2);
  });

  it('should disable buttons when isEditorOpen is true', () => {
    const mockAnnotatedImages = [
      { id: 0, name: 'test', image: 'test.jpg', annotations: [] },
    ];

    const { getByAltText } = render(<ImageList annotatedImage={mockAnnotatedImages} onImagePick={() => {}} isEditorOpen />);

    const button = getByAltText(mockAnnotatedImages[0].name).parentElement;
    expect(button).toBeDisabled();
  });
});