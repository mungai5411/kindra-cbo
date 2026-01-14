import { useState, useEffect } from 'react';

export type DeviceType = 'MOBILE' | 'TABLET' | 'DESKTOP';

export const useDeviceType = (): DeviceType => {
    const [deviceType, setDeviceType] = useState<DeviceType>('DESKTOP');

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            if (width < 600) {
                setDeviceType('MOBILE');
            } else if (width >= 600 && width < 1024) {
                setDeviceType('TABLET');
            } else {
                setDeviceType('DESKTOP');
            }
        };

        // Initial check
        checkDevice();

        // Add listener
        window.addEventListener('resize', checkDevice);

        // Cleanup
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return deviceType;
};
