import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig ,LOCALE_ID,provideExperimentalZonelessChangeDetection} from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PreloadAllModules, provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideFuse } from '@fuse';
import { appRoutes } from 'app/app.routes';
import { provideAuth } from 'app/core/auth/auth.provider';
import { provideIcons } from 'app/core/icons/icons.provider';
import { provideTransloco } from 'app/core/transloco/transloco.provider';
import { mockApiServices } from 'app/mock-api';

import { NativeDateAdapter, MatDateFormats, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';

// Register the French locale data
registerLocaleData(fr);

export class FrenchDateAdapter extends NativeDateAdapter {
    parse(value: any): Date | null {
        if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
            const str = value.split('/');
            const year = Number(str[2]);
            const month = Number(str[1]) - 1;
            const date = Number(str[0]);
            return new Date(year, month, date);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
    }

    format(date: Date, displayFormat: Object): string {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${this._to2digit(day)}/${this._to2digit(month)}/${year}`;
    }

    private _to2digit(n: number) {
        return ('00' + n).slice(-2);
    }
}

export const FRENCH_DATE_FORMATS: MatDateFormats = {
    parse: {
        dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
    },
    display: {
        dateInput: 'input',
        monthYearLabel: { year: 'numeric', month: 'short' },
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' },
    }
};

export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(appRoutes,
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
        ),
        {
            provide: MatPaginatorIntl,
            useFactory: () => ({
                ...new MatPaginatorIntl(),
                itemsPerPageLabel: 'element par page',
                nextPageLabel: 'Page suivante',
                previousPageLabel: 'Page précédente',
                firstPageLabel: 'Première page',
                lastPageLabel: 'Dernière page',
                getRangeLabel: (page: number, pageSize: number, length: number) => {
                    if (length === 0 || pageSize === 0) {
                        return `0 sur ${length}`;
                    }
                    length = Math.max(length, 0);
                    const startIndex = page * pageSize;
                    const endIndex = startIndex < length ?
                        Math.min(startIndex + pageSize, length) :
                        startIndex + pageSize;
                    return `${startIndex + 1} - ${endIndex} sur ${length}`;
                }

            })
        },
        // Material Date Adapter
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
        },
         // Provide LOCALE_ID for French
         {
            provide: LOCALE_ID,
            useValue: 'fr-FR'
        },
        { provide: MAT_DATE_LOCALE, useValue: 'fr' },
        {
            provide: DateAdapter,
            useClass: FrenchDateAdapter,
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: FRENCH_DATE_FORMATS,
        },

        // Transloco Config
        provideTransloco(),

        // Fuse
        provideAuth(),
        provideIcons(),
        provideFuse({
            mockApi: {
                delay: 0,
                services: mockApiServices,
            },
            fuse: {
                layout: 'modern',
                scheme: 'light',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme: 'theme-default',
                themes: [
                    {
                        id: 'theme-default',
                        name: 'Default',
                    },
                    {
                        id: 'theme-brand',
                        name: 'Brand',
                    },
                    {
                        id: 'theme-teal',
                        name: 'Teal',
                    },
                    {
                        id: 'theme-rose',
                        name: 'Rose',
                    },
                    {
                        id: 'theme-purple',
                        name: 'Purple',
                    },
                    {
                        id: 'theme-amber',
                        name: 'Amber',
                    },
                ],
            },
        }),
    ],
};
