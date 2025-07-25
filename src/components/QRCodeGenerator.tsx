import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ value, size = 128 }) => {
  return (
    <div className="p-4 border rounded-lg flex justify-center items-center">
      <QRCodeSVG value={value} size={size} level="H" />
    </div>
  );
};

export default QRCodeGenerator;
