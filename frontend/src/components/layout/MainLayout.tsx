import Header from '@/components/layout/Header'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import VideoTable from '@/components/videos/VideoTable'
import { useState } from 'react'

export function MainLayout() {
    const [currentPath, setCurrentPath] = useState('')

    return (
        <div className="min-h-screen min-w-screen flex flex-col">
            <Header />
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <BreadcrumbNav currentPath={currentPath} onPathChange={setCurrentPath} />
                <VideoTable currentPath={currentPath} onPathChange={setCurrentPath} />
            </main>
        </div>
    )
}