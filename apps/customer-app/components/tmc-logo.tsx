import { Image } from 'react-native';
import { SvgXml } from 'react-native-svg';

import tmcLogoXml from '@/constants/tmc-logo-xml';

type TmcLogoProps = {
  width: number;
  height: number;
};

export function TmcLogo({ width, height }: TmcLogoProps) {
  // The XML contains a massive base64 PNG embedded inside an SVG <image> tag.
  // react-native-svg often fails to render these, so we extract it and use standard Image.
  const match = tmcLogoXml.match(/data:image\/png;base64,[^"]+/);
  const uri = match ? match[0] : null;

  if (uri) {
    return <Image source={{ uri }} style={{ width, height }} resizeMode="contain" />;
  }

  // Fallback to SvgXml just in case
  return <SvgXml xml={tmcLogoXml} width={width} height={height} />;
}
