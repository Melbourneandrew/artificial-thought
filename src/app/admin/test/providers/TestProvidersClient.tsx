'use client'

import { useRef, useState } from 'react'
import TestProvider from './TestProvider'
import { Model } from '@/types'

interface TestFormElement extends HTMLFormElement {
    runTest: () => void;
}

interface TestProvidersClientProps {
    modelsByUrl: Record<string, Model[]>
}

export default function TestProvidersClient({ modelsByUrl }: TestProvidersClientProps) {
    const [isRunningAll, setIsRunningAll] = useState(false)
    const testRefs = useRef<TestFormElement[]>([])

    const runAllTests = async () => {
        setIsRunningAll(true)

        // Run all tests concurrently
        await Promise.all(
            testRefs.current
                .filter(form => form?.runTest)
                .map(form => form.runTest())
        )

        setIsRunningAll(false)
    }

    return (
        <>
            <div className="flex mb-4">
                <h1 className="text-2xl font-bold">Test Providers</h1>
                <button
                    className="btn btn-primary ml-auto"
                    onClick={runAllTests}
                    disabled={isRunningAll}
                >
                    {isRunningAll ? (
                        <>
                            <span className="loading loading-spinner"></span>
                            Running All Tests...
                        </>
                    ) : (
                        <>
                            Run All Tests
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Provider URL</th>
                            <th>Test Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(modelsByUrl).map(([url, models], index) => (
                            <tr key={url}>
                                <td className="font-mono text-sm">{url}</td>
                                <td>
                                    <TestProvider
                                        url={url}
                                        models={models}
                                        ref={(form: TestFormElement | null) => {
                                            if (form) {
                                                testRefs.current[index] = form
                                            }
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
} 