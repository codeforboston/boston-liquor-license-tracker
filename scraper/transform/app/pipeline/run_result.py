class RunResult:
    def __init__(self, proceed: bool = True, reason: str | None = None):
        self.proceed = proceed
        self.reason = reason
