using DotnetFullstackSaaS.Application.Features.Orders.Dtos;
using FluentValidation;

namespace DotnetFullstackSaaS.Application.Features.Orders.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.CustomerEmail)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.ProductName)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.TotalAmount)
            .GreaterThan(0);

        RuleFor(x => x.Currency)
            .NotEmpty()
            .Length(3);
    }
}
