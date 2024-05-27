const CORE_API = `http://localhost:8080`;

const CORE_API_PROD = 'http://dev-local.cloud-digitransform.co:5033';

export const environment = {
    production: false,
    apiUrl: `${CORE_API}`,
    url: CORE_API,
};


export const displayImageCore = (urlImage: string, url = environment.apiUrl) => displayImage(urlImage, url)

function displayImage(urlImage: string, url = environment.url) {
    const IMAGE = 'assets/images/logo/logo.png';

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
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
