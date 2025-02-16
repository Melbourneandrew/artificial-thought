'use client'
import CalendarIcon from '@/components/icons/CalendarIcon'
export function ScheduleTopicButton() {
    return (
        <button
            className="btn btn-primary"
            // @ts-ignore
            onClick={() => document.getElementById('schedule_topic_modal')?.showModal()}
        >
            Schedule New Topic
            <CalendarIcon />
        </button>
    )
} 