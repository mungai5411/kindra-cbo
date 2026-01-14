export const KENYA_COUNTIES = [
    {
        name: 'Nairobi',
        sub_counties: ['Dagoretti North', 'Dagoretti South', 'Embakasi Central', 'Embakasi East', 'Embakasi North', 'Embakasi South', 'Embakasi West', 'Kamukunji', 'Kasarani', 'Kibra', 'Lang\'ata', 'Makadara', 'Mathare', 'Roysambu', 'Ruaraka', 'Starehe', 'Westlands']
    },
    {
        name: 'Mombasa',
        sub_counties: ['Changamwe', 'Jomvu', 'Kisauni', 'Nyali', 'Likoni', 'Mvita']
    },
    {
        name: 'Kiambu',
        sub_counties: ['Gatundu North', 'Gatundu South', 'Githunguri', 'Juja', 'Kabete', 'Kiambaa', 'Kiambu Town', 'Kikuyu', 'Lari', 'Limuru', 'Ruiru', 'Thika Town']
    },
    {
        name: 'Nakuru',
        sub_counties: ['Bahati', 'Gilgil', 'Kuresoi North', 'Kuresoi South', 'Molo', 'Naivasha', 'Nakuru Town East', 'Nakuru Town West', 'Njoro', 'Rongai', 'Subukia']
    },
    {
        name: 'Kisumu',
        sub_counties: ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Muhoroni', 'Nyakach', 'Nyando', 'Seme']
    },
    {
        name: 'Uasin Gishu',
        sub_counties: ['Ainabkoi', 'Kapseret', 'Kesses', 'Moiben', 'Soy', 'Turbo']
    },
    {
        name: 'Kajiado',
        sub_counties: ['Kajiado Central', 'Kajiado East', 'Kajiado North', 'Kajiado South', 'Kajiado West']
    },
    {
        name: 'Machakos',
        sub_counties: ['Kathiani', 'Machakos Town', 'Masinga', 'Matungulu', 'Mavoko', 'Mwala', 'Yatta']
    },
    {
        name: 'Kilifi',
        sub_counties: ['Ganze', 'Kaloleni', 'Kilifi North', 'Kilifi South', 'Magarini', 'Malindi', 'Rabai']
    },
    {
        name: 'Kwale',
        sub_counties: ['Kinango', 'Lunga Lunga', 'Matuga', 'Msambweni']
    }
    // Add more if needed, but these cover major areas.
].sort((a, b) => a.name.localeCompare(b.name));
