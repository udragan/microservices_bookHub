package models

type SereviceTokenRequest struct {
	ServiceName       string `json:"serviceName"`
	TargetServiceName string `json:"targetServiceName"`
	SharedSecret      string `json:"sharedSecret"`
}
