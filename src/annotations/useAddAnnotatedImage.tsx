import { useMutation } from "@tanstack/react-query";
import { AnnotatedImage } from "./models/AnnotatedImage";
import { baseApi } from "../constants";

const postAnnotatedImages = async (annotatedImage: AnnotatedImage) => (await fetch(`${baseApi}/annotatedImages`, {
    method: "post",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(annotatedImage)
})).json();

export default function useAddAnnotatedImage(onSuccess: (annotatedImage: AnnotatedImage) => void) {
    return useMutation((annotatedImage: AnnotatedImage) => postAnnotatedImages(annotatedImage), { onSuccess });
}
