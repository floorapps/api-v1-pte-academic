'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Shield, BarChart3, Target, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { clientCookies, type CookieConsent } from '@/lib/cookies-client'
import { acceptAllCookies, rejectAllCookies, saveCookiePreferences } from '@/lib/actions/cookies'

export function CookieConsentBanner() {
    const [showBanner, setShowBanner] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [preferences, setPreferences] = useState<CookieConsent>({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
    })

    useEffect(() => {
        // Check if user has already made a choice
        const consent = clientCookies.getConsent()
        if (!consent) {
            setShowBanner(true)
        }
    }, [])

    const handleAcceptAll = async () => {
        await acceptAllCookies()
        setShowBanner(false)
    }

    const handleRejectAll = async () => {
        await rejectAllCookies()
        setShowBanner(false)
    }

    const handleSavePreferences = async () => {
        await saveCookiePreferences({ ...preferences, necessary: true })
        setShowBanner(false)
        setShowSettings(false)
    }

    if (!showBanner) return null

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
            <Card className="mx-auto max-w-4xl border border-gray-200 bg-white shadow-2xl">
                {!showSettings ? (
                    // Simple Banner
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-blue-100 p-3">
                                <Cookie className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Cookie Preferences
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    We use cookies to enhance your experience, analyze site traffic, and personalize content. You can customize your preferences or accept all cookies.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Button onClick={handleAcceptAll} size="sm">
                                        Accept All
                                    </Button>
                                    <Button onClick={handleRejectAll} variant="outline" size="sm">
                                        Reject All
                                    </Button>
                                    <Button
                                        onClick={() => setShowSettings(true)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        <Settings2 className="mr-2 h-4 w-4" />
                                        Customize
                                    </Button>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowBanner(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    // Settings Panel
                    <div className="p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Customize Cookie Preferences
                            </h3>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Necessary Cookies */}
                            <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
                                <Shield className="mt-1 h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900">Necessary</h4>
                                        <span className="text-sm text-gray-500">Always active</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Essential for the website to function. Cannot be disabled.
                                    </p>
                                </div>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
                                <BarChart3 className="mt-1 h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900">Analytics</h4>
                                        <Switch
                                            checked={preferences.analytics}
                                            onCheckedChange={(checked: boolean) =>
                                                setPreferences({ ...preferences, analytics: checked })
                                            }
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Help us understand how visitors interact with our website.
                                    </p>
                                </div>
                            </div>

                            {/* Marketing Cookies */}
                            <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
                                <Target className="mt-1 h-5 w-5 text-purple-600" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900">Marketing</h4>
                                        <Switch
                                            checked={preferences.marketing}
                                            onCheckedChange={(checked: boolean) =>
                                                setPreferences({ ...preferences, marketing: checked })
                                            }
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Used to deliver personalized advertisements.
                                    </p>
                                </div>
                            </div>

                            {/* Preference Cookies */}
                            <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
                                <Settings2 className="mt-1 h-5 w-5 text-orange-600" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900">Preferences</h4>
                                        <Switch
                                            checked={preferences.preferences}
                                            onCheckedChange={(checked: boolean) =>
                                                setPreferences({ ...preferences, preferences: checked })
                                            }
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Remember your settings and preferences for a better experience.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button onClick={handleRejectAll} variant="outline">
                                Reject All
                            </Button>
                            <Button onClick={handleSavePreferences}>
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
