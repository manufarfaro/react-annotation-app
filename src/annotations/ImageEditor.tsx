import { ChangeEvent, FormEvent, FormEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { AnnotatedImage } from "./models/AnnotatedImage";
import { Box, Button, CloseButton, FormControl, FormHelperText, FormLabel, Input, Stack, Text } from "@chakra-ui/react";
import { Point } from "./models/Point";
import { useToast } from '@chakra-ui/react';
import { Annotation } from "./models/Annotation";

type ImageEditorProp = {
    annotatedImage?: AnnotatedImage;
    onCreate: (annotatedImage :AnnotatedImage) => void;
    onUpdate: (annotatedImage :AnnotatedImage) => void;
    onClose: () => void;
}

export function ImageEditor ({ annotatedImage, onClose, onUpdate, onCreate }: ImageEditorProp) {
    const toast = useToast();
    const [pickedImage, setPickedImage] = useState<string | undefined>();
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [name, setName] = useState<string>("");
    const [label, setLabel] = useState<string>("");
    const annotationsRef = useRef<Annotation[]>([]);
    const currentAnnotationRef = useRef<Annotation>({ label: "", points: [] });

    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, [setName]);

    const handleImagePick = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const file = event.target.files[0];

        const reader = new FileReader();

        reader.onload = () => {
            const base64Image = reader.result as string;
            setCanvasBg(base64Image!);
            setPickedImage(base64Image);
        }

        reader.readAsDataURL(file);

    }, [setPickedImage, pickedImage]);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const editedAnnotatedImaged: AnnotatedImage = {
            name,
            image: (pickedImage || annotatedImage?.image) as string,
            annotations
        }
        
        console.log({ name, pickedImage })
        if (!name || (!pickedImage && !annotatedImage ) || !annotations.length) {
            toast({
                title: 'Missing data.',
                description: 'There are some fields that might require your attention.',
                status: 'error',
                duration: 3000,
                isClosable: true,

            });
            return;
        }

        if (annotatedImage?.id !== undefined) {
            onUpdate({...editedAnnotatedImaged, id: annotatedImage.id});
        } else {
            onCreate(editedAnnotatedImaged);
        }
    }, [name, pickedImage, annotations, annotatedImage]);

    const setCanvasBg = (imageSelected: string) => {
        const context = canvasRef?.current?.getContext("2d");
        if (!context) return;

        var img = new Image;
        img.src = imageSelected;
        img.onload = function() {
            context.canvas.width = img.width;
            context.canvas.height = img.height;
            if (imgRef.current) imgRef.current.src = img.src;
            context.drawImage(img, 0, 0);
            drawAnnotationPolygons();
        }
    };

    const handleInputLabelChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setLabel(event.target.value);
        currentAnnotationRef.current.label = event.target.value;
    }, [currentAnnotationRef.current]);

    const clearCanvas = useCallback(() => {
        const context = canvasRef.current?.getContext("2d");
        if (!context) return;

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(imgRef.current!, 0, 0);
    }, []);

    const drawAnnotationPolygons = () => {
        
        const context = canvasRef.current?.getContext("2d");
        if (!context) return;
        
        context.strokeStyle = "black";
        const points = annotationsRef.current.map((annotation: Annotation) => annotation.points);
        if (!points) return;

        for (const point of points) {
            context.beginPath();
            context.moveTo(point[0].x, point[0].y);
            for (const coords of point) {
              context.lineTo(coords.x, coords.y);
            }
            context.closePath();
            context.stroke();
        }
      }

      const drawCurrentPolygon = (points: Point[] | undefined) => {
        const context = canvasRef.current?.getContext("2d");
        if (!context) return;

        if (!points || points.length === 0) return;
        context.strokeStyle = "red";

        // current points drawing
        for (const point of points) {
          context.beginPath();
          context.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          context.fill();
        }

        context.beginPath();

        context.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          context.lineTo(points[i].x, points[i].y);
        }

        context.closePath();
        context.stroke();
      }

    const canvasClickHandler = useCallback((event: MouseEvent) => {
        const context = canvasRef.current?.getContext("2d");
        const canvasBounds = canvasRef.current?.getBoundingClientRect();
        if (!context || !canvasBounds) return;
        // event listener callback function
        const x = event.clientX - canvasBounds.x;
        const y = event.clientY - canvasBounds.y;
      
        currentAnnotationRef.current = {
            label: currentAnnotationRef.current.label,
            points: [...currentAnnotationRef.current.points, { x, y }],
        };
        
        clearCanvas();
        drawAnnotationPolygons();
        drawCurrentPolygon(currentAnnotationRef.current.points);
      }, [clearCanvas, drawAnnotationPolygons, drawCurrentPolygon]);

    const resetCanvas = useCallback(() => {
        setLabel("");
        currentAnnotationRef.current = {
            label: "",
            points: [],
        };

        clearCanvas();
        drawAnnotationPolygons();
    }, []);

    const handleAddAnnotation = useCallback(() => {
        if (!label || currentAnnotationRef.current.points.length === 0) {
            toast({
                title: 'Missing fields on new Annotation.',
                description: 'Check your label and points and try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        annotationsRef.current.push(currentAnnotationRef.current);
        resetCanvas();
    }, [currentAnnotationRef, resetCanvas, label ]);   

    useEffect(() => {
        drawAnnotationPolygons();
      }, [annotations]);
      

    useEffect(() => {
        if (annotatedImage) {
            setCanvasBg(annotatedImage.image);
            if (name === "") setName(annotatedImage.name);
            if (pickedImage === "") setPickedImage(annotatedImage.image);
            annotationsRef.current = annotatedImage.annotations;
            setAnnotations(annotatedImage.annotations);
        }
      }, [annotatedImage, resetCanvas, drawAnnotationPolygons])
      

    useEffect(() => {
        setAnnotations(annotationsRef.current);
    }, [annotationsRef.current]);

    useEffect(() => {
        const context = canvasRef.current?.getContext("2d");
        const canvasBounds = canvasRef.current?.getBoundingClientRect();
        if (!context || !canvasBounds) return;
      
        if (canvasRef.current) {
          canvasRef.current.addEventListener("click", canvasClickHandler);
        }
      
        return () => {
          if (canvasRef.current) {
            canvasRef.current.removeEventListener("click", canvasClickHandler!);
          }
        };
      }, []);

    return(
        <Box bgColor="gray.100" borderRadius="md" p={8}>
            <Box width="100%" display="flex" justifyContent="right">
                <CloseButton onClick={onClose} />
            </Box>

            <form id="edit-image" onSubmit={handleSubmit} >
                <FormControl>
                    <FormLabel>Annotation Name</FormLabel>
                    <Input type='text' name="name" data-testid="name-input" value={name} onChange={handleNameChange}/>
                    <FormLabel>Upload Image</FormLabel>
                    <Input type='file' onInput={handleImagePick}/>
                    <FormHelperText>You'll be able to do annotations once you upload your image.</FormHelperText>
                </FormControl>

                <Box marginY={8} display="flex">
                    <img ref={imgRef} style={{ display: "none" }} data-testid="image" />
                    <canvas style={{ border: "1px solid gray" }} ref={canvasRef} data-testid="canvas"></canvas>
                </Box>

                {(pickedImage !== undefined || annotatedImage?.id !== undefined) && 
                    <>
                        <Box textAlign="left">
                            <Text fontSize='md'>Annotations</Text>
                            <ul>
                                { !annotations.length && <Box>You have no annotations yet!</Box> }
                                {annotations?.map((annotation, index) => (
                                    <li key={index}>
                                        {annotation.label}:
                                        <ul>
                                        {annotation?.points?.map((point, index) => (
                                            <li key={index}>
                                            <b>x</b>: {point.x}, <b>y</b>: {point.y}
                                            </li>
                                        ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </Box>
                        <Box>
                            <Stack spacing={4} direction='row' marginY={8} align='center'>
                                <Input type="text" name="label" value={label} onChange={handleInputLabelChange} placeholder="Add a label for this annotation" />
                                <Button onClick={handleAddAnnotation} >Add</Button>
                                <Button onClick={resetCanvas} >Clear</Button>
                            </Stack>
                            <Stack spacing={4} direction='row' align='center'>
                                <Input type="submit" bgColor="blue.300" value="Submit" />
                            </Stack>
                        </Box>
                    </>
                }
            </form>
        </Box>
    );
}