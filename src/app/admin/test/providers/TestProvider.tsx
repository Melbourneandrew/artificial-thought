'use client'

import { Model } from '@/types'
import { useState, useRef, useEffect, forwardRef } from 'react'
import { useActionState } from 'react'
import { testProvider } from './actions'

interface TestProviderProps {
    url: string
    models: Model[]
}

interface TestFormElement extends HTMLFormElement {
    runTest: () => void;
}

const TestProvider = forwardRef<TestFormElement, TestProviderProps>(function TestProvider(
    { url, models },
    ref
) {
    const [selectedModel, setSelectedModel] = useState<string>(models[0]?.id || '')
    const [state, formAction, pending] = useActionState(testProvider, {
        error: '',
        result: ''
    })
    const formRef = useRef<HTMLFormElement>(null)

    // Expose test function that can be called from parent
    const runTest = () => {
        formRef.current?.requestSubmit()
    }

    const handleSubmit = async (formData: FormData) => {
        await formAction(formData)
    }

    return (
        <div>
            <form
                ref={(element) => {
                    if (element) {
                        (element as TestFormElement).runTest = runTest;
                        formRef.current = element;

                        if (typeof ref === 'function') {
                            ref(element as TestFormElement);
                        } else if (ref) {
                            ref.current = element as TestFormElement;
                        }
                    }
                }}
                action={handleSubmit}
                className="flex gap-2 items-center"
            >
                <input type="hidden" name="url" value={url} />

                <select
                    className="select select-bordered select-sm w-48"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    name="model_id"
                    disabled={pending}
                >
                    {models.map(model => (
                        <option key={model.id} value={model.id}>
                            {model.model_name}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="btn btn-sm btn-info"
                    disabled={pending}
                >
                    {pending ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Testing...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Test
                        </>
                    )}
                </button>
            </form>

            {state.error && (
                <div className="alert alert-error mt-2 py-2 text-sm">
                    <span>{state.error.split('\n')[0]}</span>
                </div>
            )}

            {state.result && (
                <div className="mt-2">
                    <div className="alert alert-success py-2 text-sm">
                        <span>Success!</span>
                    </div>
                    <pre className="bg-base-300 p-2 rounded-lg mt-2 text-xs overflow-x-auto">
                        {state.result.split('\n')[0]}
                    </pre>
                </div>
            )}
        </div>
    )
})

export default TestProvider 