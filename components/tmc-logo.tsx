import { SvgXml } from 'react-native-svg';

import tmcLogoXml from '@/constants/tmc-logo-xml';

type TmcLogoProps = {
  width: number;
  height: number;
};

export function TmcLogo({ width, height }: TmcLogoProps) {
  return <SvgXml xml={tmcLogoXml} width={width} height={height} />;
}
