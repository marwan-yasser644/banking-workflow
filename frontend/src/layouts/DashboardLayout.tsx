import { ReactNode } from 'react'
import { Sidebar } from '@/components/common/Sidebar'
import { TopNav } from '@/components/common/TopNav'

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <TopNav />
        <main className="flex-1 overflow-auto pt-16 pb-6">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
