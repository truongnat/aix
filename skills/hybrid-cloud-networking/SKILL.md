---
name: hybrid-cloud-networking
description: Configure secure, high-performance connectivity between on-premises infrastructure and cloud platforms using VPN and dedicated connections. Use when building hybrid cloud architectures, connecting data centers to cloud, or implementing secure cross-premises networking.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "cloud,infrastructure,deployment"
  roles: "platform-engineer,devops-engineer"
  compatible: "claude,cursor,codex,gemini"

---

# Hybrid Cloud Networking

## Boundary

**`sk-hybrid-cloud-networking`** owns **hybrid connectivity architecture across on-premises and cloud networks, routing, redundancy, and security boundaries**. It does not own **application-level networking, cloud resource provisioning, or security certification as the primary concern**; route those concerns to the appropriate specialist skill.

Configure secure, high-performance connectivity between on-premises and cloud environments using VPN, Direct Connect, ExpressRoute, Interconnect, and FastConnect.

## Purpose

Establish secure, reliable network connectivity between on-premises data centers and cloud providers (AWS, Azure, GCP, OCI).

## When to Use

- Connect on-premises to cloud
- Extend datacenter to cloud
- Implement hybrid active-active setups
- Meet compliance requirements
- Migrate to cloud gradually

## Connection Options

### AWS Connectivity

#### 1. Site-to-Site VPN

- IPSec VPN over internet
- Up to 1.25 Gbps per tunnel
- Cost-effective for moderate bandwidth
- Higher latency, internet-dependent

```hcl
resource "aws_vpn_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "main-vpn-gateway"
  }
}

resource "aws_customer_gateway" "main" {
  bgp_asn    = 65000
  ip_address = "203.0.113.1"
  type       = "ipsec.1"
}

resource "aws_vpn_connection" "main" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.main.id
  type                = "ipsec.1"
  static_routes_only  = false
}
```

#### 2. AWS Direct Connect

- Dedicated network connection
- 1 Gbps to 100 Gbps
- Lower latency, consistent bandwidth
- More expensive, setup time required

**Reference:** See `references/direct-connect.md`

### Azure Connectivity

#### 1. Site-to-Site VPN

```hcl
resource "azurerm_virtual_network_gateway" "vpn" {
  name                = "vpn-gateway"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  type     = "Vpn"
  vpn_type = "RouteBased"
  sku      = "VpnGw1"

  ip_configuration {
    name                          = "vnetGatewayConfig"
    public_ip_address_id          = azurerm_public_ip.vpn.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.gateway.id
  }
}
```

#### 2. Azure ExpressRoute

- Private connection via connectivity provider
- Up to 100 Gbps
- Low latency, high reliability
- Premium for global connectivity

### GCP Connectivity

#### 1. Cloud VPN

- IPSec VPN (Classic or HA VPN)
- HA VPN: 99.99% SLA
- Up to 3 Gbps per tunnel

#### 2. Cloud Interconnect

- Dedicated (10 Gbps, 100 Gbps)
- Partner (50 Mbps to 50 Gbps)
- Lower latency than VPN

### OCI Connectivity

#### 1. IPSec VPN Connect

- IPSec VPN with redundant tunnels
- Dynamic routing through DRG
- Good fit for branch offices and migration phases

#### 2. OCI FastConnect

- Private dedicated connectivity through Oracle or partner edge
- Suitable for predictable throughput and lower-latency hybrid traffic
- Commonly paired with DRG for hub-and-spoke designs

## Hybrid Network Patterns

### Pattern 1: Hub-and-Spoke

```
On-Premises Datacenter
         ↓
    VPN/Direct Connect
         ↓
    Transit Gateway (AWS) / vWAN (Azure)
         ↓
    ├─ Production VPC/VNet
    ├─ Staging VPC/VNet
    └─ Development VPC/VNet
```

### Pattern 2: Multi-Region Hybrid

```
On-Premises
    ├─ Direct Connect → us-east-1
    └─ Direct Connect → us-west-2
            ↓
        Cross-Region Peering
```

### Pattern 3: Multi-Cloud Hybrid

```
On-Premises Datacenter
    ├─ Direct Connect → AWS
    ├─ ExpressRoute → Azure
    ├─ Interconnect → GCP
    └─ FastConnect → OCI
```

## Routing Configuration

### BGP Configuration

```
On-Premises Router:
- AS Number: 65000
- Advertise: 10.0.0.0/8

Cloud Router:
- AS Number: 64512 (AWS), 65515 (Azure), provider-assigned for GCP/OCI
- Advertise: Cloud VPC/VNet CIDRs
```

### Route Propagation

- Enable route propagation on route tables
- Use BGP for dynamic routing
- Implement route filtering
- Monitor route advertisements

## Security Best Practices

1. **Use private connectivity** (Direct Connect/ExpressRoute/Interconnect/FastConnect)
2. **Implement encryption** for VPN tunnels
3. **Use VPC endpoints** to avoid internet routing
4. **Configure network ACLs** and security groups
5. **Enable VPC Flow Logs** for monitoring
6. **Implement DDoS protection**
7. **Use PrivateLink/Private Endpoints**
8. **Monitor connections** with CloudWatch/Azure Monitor/Cloud Monitoring/OCI Monitoring
9. **Implement redundancy** (dual tunnels)
10. **Regular security audits**

## High Availability

### Dual VPN Tunnels

```hcl
resource "aws_vpn_connection" "primary" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.primary.id
  type                = "ipsec.1"
}

resource "aws_vpn_connection" "secondary" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.secondary.id
  type                = "ipsec.1"
}
```

### Active-Active Configuration

- Multiple connections from different locations
- BGP for automatic failover
- Equal-cost multi-path (ECMP) routing
- Monitor health of all connections

## Monitoring and Troubleshooting

### Key Metrics

- Tunnel status (up/down)
- Bytes in/out
- Packet loss
- Latency
- BGP session status

### Troubleshooting

Validate tunnel state, BGP convergence, route symmetry, MTU, DNS, packet loss, and application reachability separately. Record the measured failure mode before changing route preference.

## Cost Optimization

1. **Right-size connections** based on traffic
2. **Use VPN for low-bandwidth** workloads
3. **Consolidate traffic** through fewer connections
4. **Minimize data transfer** costs
5. **Use dedicated private links** for high bandwidth
6. **Implement caching** to reduce traffic

## Related Skills
- `sk-system-design-pro` - For cross-cloud architecture decisions
- `sk-infrastructure-as-code-pro` - For IaC implementation

## Output

Produce a network design artifact with topology, routing/DNS, connectivity and identity controls, failure modes, observability, cost assumptions, and rollout/rollback checks.

## When not to use

- When the request is outside `sk-hybrid-cloud-networking`'s boundary or another specialist is the primary owner.
- When the requested outcome requires an external approval, production action, or attestation not supported by the available evidence.

## Required inputs

- sites/regions, providers, address ranges, bandwidth/latency targets, routing model, availability, compliance, and ownership boundaries.

## Cross-skill handoffs

- `sk-network-infra-pro` for network policy and traffic design.
- `sk-infrastructure-as-code-pro` for provisioning.
- `sk-security-pro` for threat and access controls.
- The relevant provider skill for provider-specific service behavior; name the provider and version in the evidence packet.

**Validation reference:** See `references/validation-and-troubleshooting.md` for failover, BGP, MTU, DNS, observability, and rollback cases.
## Wave 2 validation

Read [`references/hybrid-network-troubleshooting-and-rollback.md`](./references/hybrid-network-troubleshooting-and-rollback.md) when the task requires scenario-level evidence, failure/recovery coverage, or a final verification handoff. The domain skill prepares the claim and evidence packet; `sk-verify-pro` decides `pass`, `block`, or `defer`.
