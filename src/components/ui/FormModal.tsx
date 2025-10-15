'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'datetime-local' | 'url' | 'checkbox'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    custom?: (value: string | number | boolean) => string | null
  }
}

interface FormData {
  [key: string]: string | number | boolean | undefined
}

interface FormErrors {
  [key: string]: string
}

interface FormModalProps {
  title: string
  fields: FormField[]
  initialData?: FormData
  isOpen: boolean
  isSubmitting: boolean
  submitLabel?: string
  cancelLabel?: string
  onSubmit: (data: FormData) => Promise<void> | void
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function FormModal({
  title,
  fields,
  initialData = {},
  isOpen,
  isSubmitting,
  submitLabel = 'Simpan',
  cancelLabel = 'Batal',
  onSubmit,
  onClose,
  size = 'md'
}: FormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Reset form when modal opens/closes or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialData)
      setErrors({})
      setTouched({})
    }
  }, [isOpen, initialData])

  const getInputValue = (value: string | number | boolean | undefined): string => {
    if (typeof value === 'boolean') return ''
    if (typeof value === 'number') return value.toString()
    return value || ''
  }

  const validateField = useCallback((name: string, value: string | number | boolean | undefined): string | null => {
    const field = fields.find(f => f.name === name)
    if (!field) return null

    // Required validation
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} wajib diisi`
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') return null

    const stringValue = String(value)

    // Type-specific validations
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
      return 'Format email tidak valid'
    }

    if (field.type === 'url' && !/^https?:\/\/.+/.test(stringValue)) {
      return 'URL harus dimulai dengan http:// atau https://'
    }

    // Custom validations
    if (field.validation) {
      if (field.validation.min !== undefined && typeof value === 'number' && value < field.validation.min) {
        return `${field.label} minimal ${field.validation.min}`
      }
      if (field.validation.max !== undefined && typeof value === 'number' && value > field.validation.max) {
        return `${field.label} maksimal ${field.validation.max}`
      }
      if (field.validation.pattern && !field.validation.pattern.test(stringValue)) {
        return `${field.label} format tidak valid`
      }
      if (field.validation.custom) {
        return field.validation.custom(value)
      }
    }

    return null
  }, [fields])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    const newValue = type === 'checkbox' ? checked : type === 'number' ? (value ? parseFloat(value) : '') : value

    setFormData(prev => ({ ...prev, [name]: newValue }))

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors(prev => ({ ...prev, [name]: error || '' }))
    }
  }

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name])
    setErrors(prev => ({ ...prev, [name]: error || '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: FormErrors = {}
    let hasErrors = false

    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name])
      if (error) {
        newErrors[field.name] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}))

    if (hasErrors) return

    try {
      await onSubmit(formData)
    } catch {
      // Error handling is done in parent component
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md'
      case 'md': return 'max-w-lg'
      case 'lg': return 'max-w-2xl'
      case 'xl': return 'max-w-4xl'
      default: return 'max-w-lg'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full ${getSizeClasses()} bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={field.type === 'textarea' || field.type === 'checkbox' ? 'md:col-span-2' : ''}
                >
                  {field.type === 'checkbox' ? (
                    <div className="flex items-center space-x-3">
                      <input
                        id={field.name}
                        name={field.name}
                        type="checkbox"
                        checked={Boolean(formData[field.name])}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                    </div>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={getInputValue(formData[field.name])}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur(field.name)}
                          placeholder={field.placeholder}
                          rows={4}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors[field.name] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                          }`}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={getInputValue(formData[field.name])}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur(field.name)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors[field.name] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Pilih {field.label.toLowerCase()}</option>
                          {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={getInputValue(formData[field.name])}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur(field.name)}
                          placeholder={field.placeholder}
                          required={field.required}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors[field.name] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                          }`}
                        />
                      )}
                    </>
                  )}

                  {/* Error Message */}
                  <AnimatePresence>
                    {errors[field.name] && touched[field.name] && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 mt-2 text-sm text-red-600"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors[field.name]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {submitLabel}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}