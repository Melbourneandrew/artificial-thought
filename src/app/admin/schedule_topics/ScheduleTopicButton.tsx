'use client'
import CalendarIcon from '@/components/icons/CalendarIcon'
export function ScheduleTopicButton() {
    return (
        <button
            className="btn btn-primary"
            onClick={() => (document.getElementById('schedule_topic_modal') as HTMLDialogElement)?.showModal()}
        >
            Schedule New Topic
            <CalendarIcon />
        </button>
    )
} 