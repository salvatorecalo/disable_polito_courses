chrome.storage.local.get({ hiddenCoursesNames: [] }, (result) => {
    const hiddenCourses: string[] = result.hiddenCoursesNames as string[] || []

    if (hiddenCourses.length === 0) return

    const hideCourses = () => {
        const courses = document.querySelectorAll<HTMLElement>('.home-carico-container .list-group-item')

        courses.forEach((course) => {
            const nameSpan = course.querySelector('.course-detail.truncated')
            const courseName = nameSpan?.textContent?.trim()

            if (courseName && hiddenCourses.includes(courseName)) {
                course.style.display = "none";
            }
        })
    }

    hideCourses()

    const observer = new MutationObserver(() => {
        hideCourses()
    })

    observer.observe(document.body, { childList: true, subtree: true });
})