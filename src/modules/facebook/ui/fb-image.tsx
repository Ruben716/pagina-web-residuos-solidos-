"use client";

import Image, { type ImageProps } from "next/image";
import { type SyntheticEvent, useState } from "react";

/**
 * Imagen de Facebook que se retira sola si llega rota o vacía. Pasa con enlaces antiguos compartidos:
 * la web original ya no existe y Facebook entrega una imagen de 1 px. Debajo queda el ícono del contenedor.
 */
export function FbImage(props: ImageProps) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  const check = (e: SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.naturalWidth < 2) setBroken(true);
  };
  return <Image {...props} alt={props.alt} onLoad={check} onError={() => setBroken(true)} />;
}
