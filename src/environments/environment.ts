const CORE_API_PROD = 'https://bank-api.dev-solus.com';


export const environment = {
    production: true,

    apiUrl: `${CORE_API_PROD}`,

    url: CORE_API_PROD,
};

export const displayImageCore = (urlImage: string, url = environment.apiUrl) => displayImage(urlImage, url)

function displayImage(urlImage: string, url = environment.url) {
    const IMAGE = 'assets/images/detail/yugi-back.jpg';

    if (!urlImage) {
        return IMAGE;
    }

    if (urlImage.includes('assets')) {
        return urlImage;
    }

    if (urlImage.startsWith('[') && urlImage.endsWith(']')) {
        try {
            const img: string = (JSON.parse(urlImage) as string[])[0];
            return `${url}/${img}`;
        } catch (error) {
            return IMAGE;
        }
    }

    if (urlImage?.startsWith('http')) {
        return urlImage;
    }
    if (!urlImage.includes('/')) {
        return IMAGE;
    }

    if (urlImage.startsWith('data:')) {
        return urlImage;
    }

    return `${url}/${urlImage}`;
}
