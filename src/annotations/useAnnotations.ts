import { AnnotatedImage } from "./models/AnnotatedImage";
import { useQuery } from "@tanstack/react-query";
import { baseApi } from "../constants";

const getAnnotations = async () => await (await fetch(`${baseApi}/annotatedImages`)).json();

export const annotationsCacheKey = "AnnotatedImages";

export default function useAnnotations() {
    return useQuery<AnnotatedImage[]>([annotationsCacheKey], getAnnotations);
}