import { HttpInterceptorFn } from '@angular/common/http';
import { map } from 'rxjs';

export interface ApiResponse<T> {
    status: boolean;
    data: T;
    message: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
    meta?: any;
    links?: any;
}

/**
 * Fonction intercepteur pour normaliser les réponses API
 * Tous les endpoints devraient retourner { status: boolean, data: any, message: string }
 * Cet intercepteur extrait automatiquement la propriété data
 * Pour les réponses paginées (avec meta et links), conserve la structure complète
 */
export const apiNormalizationInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        map((event) => {
            // Vérifier si c'est une réponse HTTP avec un body
            if (event.type === 4 && event.body && typeof event.body === 'object' && 'status' in event.body) {
                // 4 = HttpResponse
                const apiResponse = event.body as PaginatedApiResponse<any>;

                // Si c'est une réponse API standardisée
                if (apiResponse.status !== undefined && 'data' in apiResponse) {
                    // Vérifier si c'est une réponse paginée (contient meta et/ou links)
                    if (apiResponse.meta || apiResponse.links) {
                        // Pour les réponses paginées, retourner la structure complète (data, meta, links)
                        console.log('✅ [API NORMALIZATION] Réponse API paginée préservée:', {
                            data: apiResponse.data,
                            meta: apiResponse.meta,
                            links: apiResponse.links
                        });
                        return event.clone({
                            body: {
                                data: apiResponse.data,
                                meta: apiResponse.meta,
                                links: apiResponse.links
                            }
                        });
                    } else {
                        // Pour les réponses non paginées, extraire seulement data
                        console.log('✅ [API NORMALIZATION] Réponse API standardisée:', apiResponse.data);
                        return event.clone({
                            body: apiResponse.data
                        });
                    }
                }
            }

            return event;
        })
    );
};
