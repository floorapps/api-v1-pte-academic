'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface ScoringProgressModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ScoringProgressModal({
    open,
    onOpenChange,
}: ScoringProgressModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Score Details</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                    {/* Animated loader */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">Scoring</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Status text */}
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            AI scoring ongoing...
                        </h3>
                        <p className="text-sm text-gray-500">
                            Takes around 30-60 seconds.<br />
                            You can check back later
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
