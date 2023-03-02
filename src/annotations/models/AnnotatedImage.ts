import { Annotation } from "./Annotation";

export type AnnotatedImage = {
    id?: number;
    name: string;
    image: string;
    annotations: Annotation[];
}