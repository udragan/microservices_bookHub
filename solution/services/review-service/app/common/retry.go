package common

import (
	"math"
	"time"
)

var MAX_DELAY = time.Duration(600 * time.Second) // 10 minutes

func GetExponentialBackoffDelay(attempt int) time.Duration {
	delay := time.Duration(math.Pow(2, float64(attempt))) * time.Second
	if delay > MAX_DELAY {
		return MAX_DELAY
	}
	return delay
}
