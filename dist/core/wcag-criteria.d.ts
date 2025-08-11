import { WCAGCriteria } from '../types';
export declare const PRIORITY_WCAG_CRITERIA: WCAGCriteria[];
export declare const GOV_PT_CRITICAL_CRITERIA: WCAGCriteria[];
export type CriteriaSet = 'untile' | 'gov-pt' | 'custom';
export interface ValidationOptions {
    criteriaSet: CriteriaSet;
    customCriteria?: string[];
    useStandardFormula?: boolean;
}
export declare function getCriteriaById(id: string): WCAGCriteria | undefined;
export declare function getCriteriaByPriority(priority: 'P0' | 'P1' | 'P2'): WCAGCriteria[];
export declare function getCriteriaByPrinciple(principle: 'PERCEIVABLE' | 'OPERABLE' | 'UNDERSTANDABLE' | 'ROBUST'): WCAGCriteria[];
export declare function getCriticalCriteria(): WCAGCriteria[];
export declare function isPriorityCriteria(id: string): boolean;
export declare function getCriteriaBySet(criteriaSet: CriteriaSet, customCriteria?: string[]): WCAGCriteria[];
export declare function getCriteriaIdsBySet(criteriaSet: CriteriaSet, customCriteria?: string[]): string[];
export declare function isCriteriaInSet(criteriaId: string, criteriaSet: CriteriaSet, customCriteria?: string[]): boolean;
export declare function getCriteriaSetStats(criteriaSet: CriteriaSet, customCriteria?: string[]): {
    total: number;
    byLevel: {
        A: number;
        AA: number;
        AAA: number;
    };
    byPrinciple: {
        PERCEIVABLE: number;
        OPERABLE: number;
        UNDERSTANDABLE: number;
        ROBUST: number;
    };
    byPriority: {
        P0: number;
        P1: number;
        P2: number;
    };
};
//# sourceMappingURL=wcag-criteria.d.ts.map