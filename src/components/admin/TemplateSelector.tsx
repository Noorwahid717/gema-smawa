'use client'

import { useState } from 'react'
import { WebLabTemplate, WEB_LAB_TEMPLATES } from '@/data/webLabTemplates'
import { CheckCircleIcon, CodeBracketIcon, PaintBrushIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'

interface TemplateSelectorProps {
  selectedTemplate?: WebLabTemplate | null
  onTemplateSelect: (template: WebLabTemplate) => void
  className?: string
}

export function TemplateSelector({ selectedTemplate, onTemplateSelect, className = '' }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<WebLabTemplate['category']>('basic')

  const categories = [
    { id: 'basic', name: 'Dasar', icon: CodeBracketIcon, description: 'Template sederhana untuk pemula' },
    { id: 'intermediate', name: 'Menengah', icon: PaintBrushIcon, description: 'Template dengan fitur lebih kompleks' },
    { id: 'advanced', name: 'Lanjutan', icon: WrenchScrewdriverIcon, description: 'Template untuk proyek advanced' }
  ] as const

  const templates = WEB_LAB_TEMPLATES.filter(template => template.category === selectedCategory)

  const getDifficultyColor = (difficulty: WebLabTemplate['difficulty']) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pilih Kategori Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as WebLabTemplate['category'])}
                className={`p-4 border rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div>
                    <h4 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {category.name}
                    </h4>
                    <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                      {category.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pilih Template</h3>
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id

            return (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onTemplateSelect(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {template.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      {isSelected && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">
                      {template.description}
                    </p>

                    {/* Preview of code structure */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-medium text-gray-700 mb-1">HTML</div>
                        <div className="text-gray-600 font-mono text-xs">
                          {template.html.length > 100
                            ? `${template.html.substring(0, 100)}...`
                            : template.html
                          }
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-medium text-gray-700 mb-1">CSS</div>
                        <div className="text-gray-600 font-mono text-xs">
                          {template.css.length > 100
                            ? `${template.css.substring(0, 100)}...`
                            : template.css
                          }
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-medium text-gray-700 mb-1">JavaScript</div>
                        <div className="text-gray-600 font-mono text-xs">
                          {template.js.length > 100
                            ? `${template.js.substring(0, 100)}...`
                            : template.js
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada template tersedia untuk kategori ini.
          </div>
        )}
      </div>

      {/* Selected Template Summary */}
      {selectedTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Template Terpilih</h4>
          </div>
          <p className="text-blue-800">
            <strong>{selectedTemplate.name}</strong> - {selectedTemplate.description}
          </p>
        </div>
      )}
    </div>
  )
}