import { useMutation } from "@tanstack/react-query";
import { AnnotatedImage } from "./models/AnnotatedImage";
import { baseApi } from "../constants";

const putAnnotatedImages = async (annotatedImage: AnnotatedImage) => (await fetch(`${baseApi}/annotatedImages/${annotatedImage.id}`, {
    method: "put",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(annotatedImage)
})).json();

export default function useUpdateAnnotatedImage(onSuccess: (annotatedImage: AnnotatedImage) => void) {
    return useMutation((annotatedImage: AnnotatedImage) => putAnnotatedImages(annotatedImage), { onSuccess });
}
