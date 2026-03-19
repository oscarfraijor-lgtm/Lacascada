'use client'

import React from 'react'
import { Users, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

// Brand configuration
const BRAND = {
  name: 'INDIE PRO MARKETING',
  tagline: 'Gestión de Proyectos',
  logo: '/logo.png',
  colors: {
    primary: '#E63946',
    secondary: '#457B9D',
    accent: '#F1FAEE',
    dark: '#1D3557',
    yellow: '#F4A261'
  }
}

interface TeamMember {
  id: string
  fullName: string
  username: string
  avatarUrl?: string
  initials?: string
  activeTasks: number
  pendingTasks: number
  completedTasks: number
  activeTasksList: string[]
}

interface TeamReportProps {
  members: TeamMember[]
  reportDate: string
  totalProjects: number
  totalActiveTasks: number
  totalPendingTasks: number
  totalCompletedTasks: number
}

export default function TeamReport({
  members,
  reportDate,
  totalProjects,
  totalActiveTasks,
  totalPendingTasks,
  totalCompletedTasks
}: TeamReportProps) {
  
  const PageWrapper = ({ children, pageNumber, totalPages = 1, hideHeaderFooter = false }: { 
    children: React.ReactNode
    pageNumber: number
    totalPages?: number
    hideHeaderFooter?: boolean 
  }) => (
    <div className="report-page bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-20 -mr-32 -mt-32" />
      
      <div className="flex flex-col h-full relative z-10">
        {!hideHeaderFooter && (
          <div className="mb-6 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center text-white font-black text-xs">
                IP
              </div>
              {BRAND.name} | {BRAND.tagline}
            </div>
            <div>Reporte de Equipo</div>
          </div>
        )}
        
        {children}
        
        {!hideHeaderFooter && (
          <div className="mt-auto pt-6 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
            <div>© 2025 {BRAND.name}</div>
            <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              Página {pageNumber} de {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const SectionHeader = ({ title, icon: Icon, color = BRAND.colors.primary }: { 
    title: string
    icon?: any
    color?: string 
  }) => (
    <div className="flex items-center gap-3 mb-6">
      {Icon && (
        <div className="p-2.5 rounded-2xl shadow-sm" 
             style={{ backgroundColor: `${color}15`, boxShadow: `0 4px 12px ${color}20` }}>
          <Icon className="w-5 h-5" style={{ color: color }} />
        </div>
      )}
      <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
    </div>
  )

  // Sort members by pending tasks (descending)
  const sortedMembers = [...members].sort((a, b) => b.pendingTasks - a.pendingTasks)
  const topPerformers = sortedMembers.filter(m => m.completedTasks > 0).slice(0, 3)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: letter;
            margin: 0;
          }
          
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .report-page {
            page-break-after: always;
            page-break-inside: avoid;
            width: 8.5in;
            height: 11in;
            padding: 0.5in;
            margin: 0;
            box-sizing: border-box;
          }
          
          .report-page:last-child {
            page-break-after: auto;
          }
        }
        
        @media screen {
          .report-container {
            max-width: 8.5in;
            margin: 2rem auto;
            padding: 0 1rem;
          }
          
          .report-page {
            width: 8.5in;
            min-height: 11in;
            padding: 0.5in;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 0.5rem;
          }
        }
      `}} />

      <main className="report-container">
        {/* Page 1: Cover + Overview */}
        <PageWrapper pageNumber={1} totalPages={2} hideHeaderFooter>
          <div className="h-full flex flex-col justify-center relative">
            {/* Hero Section */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl shadow-lg">
                  <Users className="w-6 h-6" />
                  <span className="font-black text-lg tracking-tight">REPORTE DE EQUIPO</span>
                </div>
                
                <h1 className="text-5xl font-black tracking-tighter text-gray-900 leading-tight">
                  Carga de Trabajo<br />y Desempeño
                </h1>
                
                <p className="text-lg text-gray-600 font-semibold">
                  {reportDate}
                </p>
              </div>

              {/* KPIs Grid */}
              <div className="grid grid-cols-4 gap-4 mt-12">
                <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-xs font-bold opacity-75 mb-2">PROYECTOS</div>
                  <div className="text-4xl font-black mb-1">{totalProjects}</div>
                  <div className="text-xs opacity-90">Activos</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-xs font-bold opacity-75 mb-2">TAREAS ACTIVAS</div>
                  <div className="text-4xl font-black mb-1">{totalActiveTasks}</div>
                  <div className="text-xs opacity-90">En proceso</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-xs font-bold opacity-75 mb-2">PENDIENTES</div>
                  <div className="text-4xl font-black mb-1">{totalPendingTasks}</div>
                  <div className="text-xs opacity-90">Por atender</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-xs font-bold opacity-75 mb-2">COMPLETADAS</div>
                  <div className="text-4xl font-black mb-1">{totalCompletedTasks}</div>
                  <div className="text-xs opacity-90">Esta semana</div>
                </div>
              </div>

              {/* Top Performers */}
              {topPerformers.length > 0 && (
                <div className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                  <SectionHeader title="Top Performers" icon={TrendingUp} color="#10B981" />
                  <div className="grid grid-cols-3 gap-4">
                    {topPerformers.map((member, idx) => (
                      <div key={member.id} className="bg-white rounded-xl p-4 text-center border-2 border-green-100">
                        <div className="relative inline-block mb-3">
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.fullName} className="w-16 h-16 rounded-full" />
                          ) : (
                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center font-black text-2xl">
                              {member.initials || member.fullName?.charAt(0)}
                            </div>
                          )}
                          {idx === 0 && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg">
                              🏆
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-gray-900">{member.fullName}</h4>
                        <p className="text-xs text-gray-500 mb-2">@{member.username}</p>
                        <div className="text-2xl font-black text-green-600">{member.completedTasks}</div>
                        <div className="text-xs text-gray-600">Completadas</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PageWrapper>

        {/* Page 2: Team Details */}
        <PageWrapper pageNumber={2} totalPages={2}>
          <SectionHeader title="Equipo y Carga de Trabajo" icon={Users} color={BRAND.colors.primary} />
          
          <div className="grid grid-cols-2 gap-4">
            {sortedMembers.map((member) => {
              const workloadLevel = member.pendingTasks > 15 ? 'high' : member.pendingTasks > 8 ? 'medium' : 'low'
              const workloadColor = workloadLevel === 'high' ? '#EF4444' : workloadLevel === 'medium' ? '#F59E0B' : '#10B981'
              const workloadBg = workloadLevel === 'high' ? 'bg-red-50' : workloadLevel === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
              const workloadBorder = workloadLevel === 'high' ? 'border-red-200' : workloadLevel === 'medium' ? 'border-yellow-200' : 'border-green-200'
              
              return (
                <div key={member.id} className={`border-2 ${workloadBorder} ${workloadBg} rounded-xl p-4`}>
                  <div className="flex items-center gap-3 mb-4">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.fullName} className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-lg">
                        {member.initials || member.fullName?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">{member.fullName}</h3>
                      <p className="text-xs text-gray-600">@{member.username}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {workloadLevel === 'high' && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {workloadLevel === 'medium' && <Clock className="w-5 h-5 text-yellow-600" />}
                      {workloadLevel === 'low' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center bg-white rounded-lg p-2 border border-gray-100">
                      <div className="text-lg font-black text-red-600">{member.activeTasks}</div>
                      <div className="text-[8px] text-gray-500 font-bold">Activas</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-2 border border-gray-100">
                      <div className="text-lg font-black text-purple-600">{member.pendingTasks}</div>
                      <div className="text-[8px] text-gray-500 font-bold">Pendientes</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-2 border border-gray-100">
                      <div className="text-lg font-black text-green-600">{member.completedTasks}</div>
                      <div className="text-[8px] text-gray-500 font-bold">Completadas</div>
                    </div>
                  </div>
                  
                  {member.activeTasksList.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Tareas Activas</p>
                      <div className="space-y-1">
                        {member.activeTasksList.slice(0, 3).map((task, idx) => (
                          <div key={idx} className="text-[9px] text-gray-700 truncate">
                            • {task}
                          </div>
                        ))}
                        {member.activeTasksList.length > 3 && (
                          <div className="text-[8px] text-gray-500 font-bold">
                            +{member.activeTasksList.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </PageWrapper>
      </main>
    </>
  )
}
