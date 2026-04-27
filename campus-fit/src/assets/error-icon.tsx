const ErrorIcon = ({ color = '#dc2626' }: { color?: string }): React.JSX.Element => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" fill="none" viewBox="0 0 24 24">
            <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2.202 18.47 7.962-14.465c.738-1.34 2.934-1.34 3.672 0l7.962 14.465c.646 1.173-.338 2.53-1.835 2.53H4.037c-1.497 0-2.481-1.357-1.835-2.53M12 9v4M12 17.02V17"/>
        </svg>
    )
}

export default ErrorIcon;