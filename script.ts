/// <reference types="chrome"/>

interface Course {
    id: number,
    name: string,
    isHidden: boolean
}

function extractCourseInfo() {
    const courses = document.querySelectorAll<HTMLElement>('.home-carico-container .list-group-item');
    const validCourses: Course[] = [];

    courses.forEach((elm, index) => {
        const nameSpan = elm.querySelector('.course-detail.truncated');
        const courseName = nameSpan?.textContent?.trim();

        if (courseName) {
            validCourses.push({
                id: index,
                name: courseName,
                isHidden: elm.style.display === "none"
            });
        }
    });

    return validCourses;
}

function toggleCourseInPage(courseIndex: number, isVisible: boolean) {
    const courseElements = document.querySelectorAll<HTMLElement>('.home-carico-container .list-group-item');
    const course = courseElements[courseIndex];
    
    if (course) {
        course.style.display = isVisible ? "" : "none";
    }
}

async function onWindowLoad() {

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    })

    const activeTabId = tabs[0]?.id

    if (!activeTabId) {
        console.error("Nessun tab attivo trovato");
        return;
    }

    const injectionScriptResult = await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        func: extractCourseInfo
    })

    const courses: Course[] = injectionScriptResult[0]?.result ?? []
    const htmlContainer = document.getElementById("courses-list")

    if (!htmlContainer) {
        console.error("No container found")
        return
    }

    if (!courses) {
        console.error("No courses found")
        return
    }

    htmlContainer.innerHTML = ""

    chrome.storage.local.get({hiddenCoursesNames: []}, (result) => {
        let hiddenCourses = result.hiddenCoursesNames as string[] || []

        courses.forEach((course: Course) => {
            const label = document.createElement("label");
            label.style.display = "block";
            label.style.marginBottom = "8px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = !hiddenCourses.includes(course.name);

            checkbox.addEventListener("change", (e) => {
                const target = e.target as HTMLInputElement;
                const isVisible = target.checked;

                chrome.scripting.executeScript({
                    target: { tabId: activeTabId },
                    func: toggleCourseInPage as any,
                    args: [course.id, isVisible]
                });

                if (isVisible) {
                    hiddenCourses = hiddenCourses.filter(name => name !== course.name);
                } else {
                    if (!hiddenCourses.includes(course.name)) {
                        hiddenCourses.push(course.name);
                    }
                }
                chrome.storage.local.set({ hiddenCoursesNames: hiddenCourses });
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(` ${course.name}`));
            htmlContainer.appendChild(label);
        })
    })
}

window.onload = onWindowLoad