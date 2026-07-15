interface Course {
    id: number;
    name: string;
    isHidden: boolean;
}
declare function extractCourseInfo(): Course[];
declare function toggleCourseInPage(courseIndex: number, isVisible: boolean): void;
declare function onWindowLoad(): Promise<void>;
//# sourceMappingURL=script.d.ts.map